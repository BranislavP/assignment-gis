FROM python:alpine3.7

RUN apk update \
  && apk add --virtual build-deps gcc python3-dev musl-dev \
  && apk add postgresql-dev \
  && pip --no-cache-dir install cython

RUN pip --no-cache-dir install \
	flask \
	python-dotenv \
	flask-wtf \
	flask-sqlalchemy \
	psycopg2 \
	Flask-Migrate

RUN apk del build-deps

EXPOSE 5000

WORKDIR "/opt/project"
CMD ["flask", "run"]
