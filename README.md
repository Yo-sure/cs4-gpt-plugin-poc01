# CS4-GPT-Plugin-POC01

이 프로젝트는 첼로스퀘어 견적 플러그인에 대한 Proof of Concept (POC)입니다.

## 사용된 서버리스 플러그인
이 POC에서는 다음 세 가지 서버리스 플러그인을 사용했습니다.

#### 1. serverless-cloudfront-invalidate
CloudFront에서의 콘텐츠 무효화를 자동화하기 위한 Serverless 플러그인입니다. 배포 후 CloudFront 캐시를 자동으로 무효화하여, 최신 콘텐츠가 사용자에게 빠르게 전달될 수 있도록 합니다.
#### 2. serverless-openapi-documentation
Serverless 애플리케이션의 API 문서화를 자동화하는 플러그인입니다. 이 플러그인을 사용하면, API Gateway와 함께 사용할 수 있는 OpenAPI (이전의 Swagger) 스펙 문서를 쉽게 생성하고 관리할 수 있습니다.
#### 3. serverless-offline
Serverless 애플리케이션을 로컬 환경에서 실행하고 테스트하기 위한 플러그인입니다. 이 플러그인을 사용하면 로컬 환경에서 Serverless 애플리케이션의 함수를 직접 호출하거나, HTTP 요청을 통해 실행해 볼 수 있습니다.

## 주의사항
ai-plugin.json, openapi.yml을 s3에 게시했는데, 플러그인 데브툴 사용을 위해선 로컬 호스트 사용이 필요합니다.
로컬호스트에 위 파일들을 게시하여야 합니다.

## 연락처
문의사항이 있으신 경우 아래의 이메일로 연락 주시기 바랍니다.
- Email: jaewng.yun@samsung.com
