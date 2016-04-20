
from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^$', 'tmm.views.home', name='home'),
    url(r'^save_project/$', 'tmm.views.save_project', name='save_project'),
)
