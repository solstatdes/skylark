from django.db import models
from jsonfield import JSONField

class Project(models.Model):
    json = JSONField()

class Library(models.Model):
    json = JSONField()


