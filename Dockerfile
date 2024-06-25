# Nginx를 기반으로 한 이미지
FROM nginx:alpine

# 빌드된 정적 파일을 Nginx의 웹 루트 디렉토리로 복사
#COPY build /usr/share/nginx/html
# 정적 파일들을 Nginx의 웹 루트 디렉토리로 복사
COPY index.html favicon.ico robots.txt logo192.png logo512.png manifest.json asset-manifest.json static/ /usr/share/nginx/html/

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf