variable "environment" { type = string }
variable "prefix" { type = string }

output "function_url" {
  value = module.api_lambda.function_url
}

resource "aws_iam_policy" "bedrock_policy" {
  name        = "${var.prefix}-api-bedrock-policy"
  description = "IAM policy for Lambda to invoke Bedrock"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = [
          "arn:aws:bedrock:eu-west-3::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:*"
        ]
      }
    ]
  })
}
module "api_lambda" {
  source       = "./modules/lambda"
  description  = "API of Code Analysis Assistant"
  environment  = var.environment
  handler      = "index.handler"
  memory_size  = "128"
  name         = "api-code-analysis-assistant"
  prefix       = var.prefix
  timeout      = "10"
  function_url = true
  attach_policies = {
    BEDROCK = aws_iam_policy.bedrock_policy.arn
  }
}


