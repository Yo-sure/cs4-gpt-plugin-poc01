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

##### 비고
- 짧은 시간동안 P.O.C 검증만을 위해 작성된 코드여서 정리가 부족합니다.
- calculateDistance 는 룩업테이블을 만들기 위해 생성한 일회성 js파일입니다.
- dynamoDB의 실제값이 poc-tariff-dml에 작성된 값과 일부 다를 수 있습니다. (매뉴얼 조작)
- aws s3 upload는 aws cli로 수행하였습니다.
- models와 serverless.doc.yml의 정보들은 serverless-openapi-document 사용을 위해 작성되었으나, 일부 openapi.yml의 변경으로 재생성시, 값이 틀어질 수 있습니다.(매뉴얼 조작)
  -> serverless-openapi-documentation 은 models와 serverless.yml, serverless.doc.yml을 참고해서 openapi.yml파일을 만드는 동작을 수행합니다. (https://www.serverless.com/plugins/serverless-openapi-documentation)
  -> 생성하고 변경해야할 부분이 있어서, openapi.yml을 일부 재작성했습니다.
