from django.shortcuts import render
from tmm.models import Project
import json

def home(request):
    projects = Project.objects.all()
    project = projects[0]
    digit = len(projects)
    
    project.json = json.dumps(project.json)

    return render(request, 'tmm.html', {'projects': json.dumps(projects[0].json).encode('utf8'), 'project': project})

