from django.shortcuts import render
from tmm.models import Project
import json

def home(request):
    projects = Project.objects.all()
    digit = len(projects)
    return render(request, 'tmm.html', {'projects': json.dumps(projects[0].json), 'digit':digit})

