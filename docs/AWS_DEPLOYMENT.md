# AWS Deployment Guide

> **⚠️ DEPRECATED**: AWS deployment has been removed from this project as of December 2025.
>
> This document is kept for historical reference only. The AWS deployment infrastructure
> and CI/CD workflow have been removed from the repository.
>
> **Alternative Deployment Options:**
> - **Railway**: See [Railway Deployment Guide](../RAILWAY_DEPLOYMENT.md)
> - **Docker**: See [Docker Deployment](../DEPLOYMENT.md#docker-deployment)
> - **Local Development**: See [Local Development Guide](LOCAL_DEVELOPMENT.md)

---

## Historical AWS Deployment Information

### Prerequisites (Deprecated)

Before deploying to AWS, you would have needed:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed locally
4. **Node.js 18+** and **Python 3.11+**
5. **Git** repository access

## Initial Setup

### 1. Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1 (or your preferred region)
# Default output format: json
```

### 2. Set Environment Variables

```bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1
export ENVIRONMENT=production
```

## Deployment Steps

### Step 1: Create Infrastructure with CloudFormation

```bash
# Navigate to project root
cd ndax-quantum-engine

# Deploy infrastructure stack
aws cloudformation create-stack \
  --stack-name ndax-infrastructure-${ENVIRONMENT} \
  --template-body file://aws/cloudformation/infrastructure.yml \
  --parameters \
    ParameterKey=EnvironmentName,ParameterValue=${ENVIRONMENT} \
  --capabilities CAPABILITY_IAM \
  --region ${AWS_REGION}

# Wait for stack creation
aws cloudformation wait stack-create-complete \
  --stack-name ndax-infrastructure-${ENVIRONMENT} \
  --region ${AWS_REGION}

# Get outputs
aws cloudformation describe-stacks \
  --stack-name ndax-infrastructure-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs' \
  --region ${AWS_REGION}
```

### Step 2: Build and Push Docker Images

#### Login to ECR

```bash
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

#### Build and Push Node.js Image

```bash
# Build image
docker build -t ndax-nodejs:latest .

# Tag for ECR
docker tag ndax-nodejs:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ENVIRONMENT}-ndax-nodejs:latest

# Push to ECR
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ENVIRONMENT}-ndax-nodejs:latest
```

#### Build and Push Python Image

```bash
# Build image
docker build -f Dockerfile.python -t ndax-python:latest .

# Tag for ECR
docker tag ndax-python:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ENVIRONMENT}-ndax-python:latest

# Push to ECR
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ENVIRONMENT}-ndax-python:latest
```

### Step 3: Configure Secrets in AWS Secrets Manager

```bash
# Create secrets for sensitive data
aws secretsmanager create-secret \
  --name ndax/api-key \
  --secret-string "${NDAX_API_KEY}" \
  --region ${AWS_REGION}

aws secretsmanager create-secret \
  --name ndax/api-secret \
  --secret-string "${NDAX_API_SECRET}" \
  --region ${AWS_REGION}

aws secretsmanager create-secret \
  --name ndax/jwt-secret \
  --secret-string "${JWT_SECRET}" \
  --region ${AWS_REGION}

aws secretsmanager create-secret \
  --name ndax/flask-secret \
  --secret-string "${FLASK_SECRET_KEY}" \
  --region ${AWS_REGION}

aws secretsmanager create-secret \
  --name ndax/encryption-key \
  --secret-string "${ENCRYPTION_KEY}" \
  --region ${AWS_REGION}
```

### Step 4: Create ECS Task Execution Role

```bash
# Create IAM role for ECS tasks
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://trust-policy.json

# Attach required policies
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

### Step 5: Register ECS Task Definitions

#### Update task definition files with your account ID and region:

```bash
# Update Node.js task definition
sed -i "s/ACCOUNT_ID/${AWS_ACCOUNT_ID}/g" aws/ecs/task-definition-nodejs.json
sed -i "s/REGION/${AWS_REGION}/g" aws/ecs/task-definition-nodejs.json

# Update Python task definition
sed -i "s/ACCOUNT_ID/${AWS_ACCOUNT_ID}/g" aws/ecs/task-definition-python.json
sed -i "s/REGION/${AWS_REGION}/g" aws/ecs/task-definition-python.json
```

#### Register task definitions:

```bash
# Register Node.js task
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs/task-definition-nodejs.json \
  --region ${AWS_REGION}

# Register Python task
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs/task-definition-python.json \
  --region ${AWS_REGION}
```

### Step 6: Create ECS Services

```bash
# Get VPC and subnet information from CloudFormation outputs
VPC_ID=$(aws cloudformation describe-stacks \
  --stack-name ndax-infrastructure-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`VPC`].OutputValue' \
  --output text)

# Create Node.js service
aws ecs create-service \
  --cluster ${ENVIRONMENT}-ndax-cluster \
  --service-name ndax-nodejs-service \
  --task-definition ndax-nodejs-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:${AWS_REGION}:${AWS_ACCOUNT_ID}:targetgroup/nodejs-tg,containerName=ndax-nodejs,containerPort=3000" \
  --region ${AWS_REGION}

# Create Python service
aws ecs create-service \
  --cluster ${ENVIRONMENT}-ndax-cluster \
  --service-name ndax-python-service \
  --task-definition ndax-python-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:${AWS_REGION}:${AWS_ACCOUNT_ID}:targetgroup/python-tg,containerName=ndax-python,containerPort=5000" \
  --region ${AWS_REGION}
```

## Auto-Scaling Configuration

### Configure Service Auto-Scaling

```bash
# Register scalable targets
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/${ENVIRONMENT}-ndax-cluster/ndax-nodejs-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10 \
  --region ${AWS_REGION}

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/${ENVIRONMENT}-ndax-cluster/ndax-nodejs-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
    'PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},TargetValue=70.0' \
  --region ${AWS_REGION}
```

## Monitoring and Logging

### CloudWatch Logs

Logs are automatically sent to CloudWatch Logs:
- Node.js: `/ecs/ndax-nodejs`
- Python: `/ecs/ndax-python`

### View logs:

```bash
# Node.js logs
aws logs tail /ecs/ndax-nodejs --follow --region ${AWS_REGION}

# Python logs
aws logs tail /ecs/ndax-python --follow --region ${AWS_REGION}
```

### CloudWatch Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name ndax-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=ndax-nodejs-service \
  --region ${AWS_REGION}
```

## Continuous Deployment with GitHub Actions

The CI/CD pipeline is already configured in `.github/workflows/ci-cd.yml`.

### Required GitHub Secrets:

1. `AWS_ACCESS_KEY_ID`
2. `AWS_SECRET_ACCESS_KEY`
3. `AWS_REGION`
4. `DOCKER_USERNAME`
5. `DOCKER_PASSWORD`

### Deployment triggers automatically on:
- Push to `main` branch
- Manual workflow dispatch

## Database Setup (Optional)

### RDS PostgreSQL

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name ndax-db-subnet \
  --db-subnet-group-description "NDAX database subnets" \
  --subnet-ids subnet-xxx subnet-yyy \
  --region ${AWS_REGION}

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier ndax-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username ndax \
  --master-user-password ${DB_PASSWORD} \
  --allocated-storage 20 \
  --db-subnet-group-name ndax-db-subnet \
  --vpc-security-group-ids sg-xxx \
  --backup-retention-period 7 \
  --region ${AWS_REGION}
```

### ElastiCache Redis

```bash
# Create cache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name ndax-cache-subnet \
  --cache-subnet-group-description "NDAX cache subnets" \
  --subnet-ids subnet-xxx subnet-yyy \
  --region ${AWS_REGION}

# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id ndax-redis \
  --replication-group-description "NDAX Redis cluster" \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-clusters 2 \
  --cache-subnet-group-name ndax-cache-subnet \
  --security-group-ids sg-xxx \
  --region ${AWS_REGION}
```

## SSL/TLS Certificate

### Request certificate from ACM:

```bash
aws acm request-certificate \
  --domain-name ndax.example.com \
  --subject-alternative-names "*.ndax.example.com" \
  --validation-method DNS \
  --region ${AWS_REGION}

# Note the certificate ARN and validate it via DNS
```

### Update ALB listener for HTTPS:

```bash
aws elbv2 create-listener \
  --load-balancer-arn ${ALB_ARN} \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=${CERTIFICATE_ARN} \
  --default-actions Type=forward,TargetGroupArn=${TARGET_GROUP_ARN} \
  --region ${AWS_REGION}
```

## Maintenance and Updates

### Update Service (Rolling Deployment)

```bash
# Update task definition (new image)
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs/task-definition-nodejs.json

# Force new deployment
aws ecs update-service \
  --cluster ${ENVIRONMENT}-ndax-cluster \
  --service ndax-nodejs-service \
  --force-new-deployment \
  --region ${AWS_REGION}
```

### Rollback

```bash
# List task definition revisions
aws ecs list-task-definitions \
  --family-prefix ndax-nodejs-task \
  --region ${AWS_REGION}

# Update service to previous revision
aws ecs update-service \
  --cluster ${ENVIRONMENT}-ndax-cluster \
  --service ndax-nodejs-service \
  --task-definition ndax-nodejs-task:PREVIOUS_REVISION \
  --region ${AWS_REGION}
```

## Cost Optimization

### Estimated Monthly Costs (us-east-1)

- **ECS Fargate**: ~$50/month (2 tasks x 0.5 vCPU, 1GB RAM)
- **ALB**: ~$20/month
- **ECR**: ~$1/month (10 GB storage)
- **CloudWatch Logs**: ~$5/month (5 GB)
- **Data Transfer**: Variable
- **Total**: ~$80-100/month

### Cost Reduction Tips:
1. Use Fargate Spot for non-critical workloads
2. Set up log retention policies
3. Use Reserved Instances for RDS
4. Enable S3 lifecycle policies
5. Monitor and clean up unused resources

## Troubleshooting

### Common Issues

**ECS Tasks failing to start:**
```bash
# Check task status
aws ecs describe-tasks \
  --cluster ${ENVIRONMENT}-ndax-cluster \
  --tasks TASK_ID \
  --region ${AWS_REGION}

# Check logs
aws logs tail /ecs/ndax-nodejs --since 1h --region ${AWS_REGION}
```

**Cannot pull image from ECR:**
- Verify IAM role has ECR permissions
- Check ECR repository policies
- Verify image tag exists

**Health check failing:**
- Verify security groups allow traffic
- Check application logs
- Test health endpoint locally

## Support

For issues or questions:
- Check CloudWatch Logs
- Review ECS task events
- Consult AWS documentation
- Open GitHub issue
