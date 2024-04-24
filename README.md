## Deploy HTML Native with NGINX to Heroku :

```
Full Documentation : https://gilangvperdana.medium.com/deploy-web-statis-dengan-nginx-pada-heroku-91c59c8ff126
```

## Environment :
```
1. Heroku CLI
2. Text Editor
```

## Installation :
```
Put your HTML Native to "app" directory.
$ git clone this_repository
$ cd Nginx-Heroku
$ cp -r ../your_html_project/* ./app/

After that, Push to your Heroku Repository Apps.
$ heroku login -i
$ heroku create your_apps_name
$ heroku buildpacks:add heroku-community/nginx

$ git init
$ heroku git:remote -a your_apps_name
$ git add *
$ git commit -m "make it better"
$ git push heroku master
$ heroku ps:scale web=1
$ heroku open
```

## Warning :
```
If you want to deploy from this repository, dont forget to :
$ cd Nginx-Heroku
$ rm -r .git/
```