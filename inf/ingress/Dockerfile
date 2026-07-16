# docker run csumbssbu-ingress -p 80:80
# docker build . -f Dockerfile -t csumbssbu-ingress

FROM nginx

RUN adduser --system --no-create-home --shell /bin/false --group --disabled-login www

RUN mkdir /etc/nginx/logs
RUN chown -P www /etc/nginx/logs

RUN touch /etc/nginx/logs/error.log
RUN touch /etc/nginx/logs/nginx.pid

COPY ./nginx.conf /etc/nginx/nginx.conf