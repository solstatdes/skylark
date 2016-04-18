from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^$', 'solidstate.views.home', name='home'),
    url(r'^tmm/', include('tmm.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
