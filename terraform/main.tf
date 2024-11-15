variable "environment" { type = string }
variable "prefix" { type = string }

output "function_url" {
  value = module.api_lambda.function_url
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
}


