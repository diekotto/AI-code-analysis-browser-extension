provider "aws" {
  region = "eu-west-3" # Paris
  default_tags {
    tags = {
      Deploy  = "terraform"
      Project = "ai-code-analysis"
    }
  }
}

provider "aws" {
  region = "eu-central-1" # Frankfurt
  alias  = "bedrock"
  default_tags {
    tags = {
      Deploy  = "terraform"
      Project = "ai-code-analysis"
    }
  }
}

provider "aws" {
  region = "us-west-2"
  alias  = "cloudfront"
  default_tags {
    tags = {
      Deploy  = "terraform"
      Project = "ai-code-analysis"
    }
  }
}
