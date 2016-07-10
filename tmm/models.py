from django.db import models
from jsonfield import JSONField
from datetime import datetime

class Project(models.Model):
    json = JSONField()

class Library(models.Model):
    json = JSONField()

class Log(models.Model):
    name = models.CharField(max_length=128)
    path = models.CharField(max_length=128)
    date = models.DateTimeField(default=datetime.now())
    ip = models.CharField(max_length=128)

    def __unicode__(self):
        return self.name



