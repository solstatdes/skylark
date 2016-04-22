from django.shortcuts import render
from django.http import HttpResponse
from tmm.models import Project
from tmm.forms import SaveForm
import json
import yaml
import os
from django.conf import settings
import db


def home(request):
    projects = Project.objects.all()
    project = projects[0]
    digit = len(projects)

    path = os.path.join(settings.STATIC_PATH, 'refractiveindex/database/library.yml')

    with open(path, 'r') as f:
        library = yaml.load(f)

    project.json = json.dumps(project.json)
    library = json.dumps(library)
    
    

    return render(request, 'tmm.html', {'project': project, 'form':SaveForm(), 'library':library})

def lib_page(request):
    if request.method == 'POST':
        page_path = os.path.join(settings.LIBRARY_PATH, request.POST.get('data'))

        with open(page_path, 'r') as f:
            page = yaml.load(f)

        # create page object using db
        page_obj = db.L(page_path)
        data = page_obj.grabData()

        response_data = {}
        response_data['page'] = json.dumps(page)
        response_data['data'] = json.dumps(data)
        return HttpResponse(
            json.dumps(response_data),
            content_type="application/json"
        )
    else:
        return HttpResponse(
            json.dumps({"nothing to see": "this isn't happening"}),
            content_type="application/json"
        )
        
def save_project(request):
    if request.method == 'POST':
        project_json = json.loads(request.POST.get('data'))
        project_id= request.POST.get('id');
        response_data = {}

        response_data['result'] = project_json;
        response_data['id'] = project_id;

        project = Project.objects.get(pk=project_id)
        project.json = project_json
        project.save()
        
        return HttpResponse(
            json.dumps(response_data),
            content_type="application/json"
        )
    else:
        return HttpResponse(
            json.dumps({"nothing to see": "this isn't happening"}),
            content_type="application/json"
        )


