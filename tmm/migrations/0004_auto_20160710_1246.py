# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('tmm', '0003_log'),
    ]

    operations = [
        migrations.AddField(
            model_name='log',
            name='name',
            field=models.CharField(default='dummy', max_length=128),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='log',
            name='date',
            field=models.DateTimeField(default=datetime.datetime(2016, 7, 10, 12, 46, 21, 550489)),
        ),
    ]
