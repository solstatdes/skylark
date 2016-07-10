from django.shortcuts import render
from django.http import HttpResponse
from tmm.models import Project, Log
from tmm.forms import SaveForm
import json
import yaml
import os
from django.conf import settings
import db
from stack import Stack
from ipware.ip import get_ip

def get_name(stack, path):
    inc = 0
    for a in stack.project:
        item = stack.project[a]
        if type(stack.project[a]) is list:
            for i in item:
                if (i.get('path', None) == path):
                    print i.get('path',None), path
                    name = i.get('layer', None)
                    inc += 1
                    print inc, name
        elif type(stack.project[a]) is dict:
            if (item.get('path', None) == path):
                name = item.get('layer', None)
                inc += 1
    if inc == 1:
        return name
    else:
        return None

def home(request):
    projects = Project.objects.all()
    project = projects[0]
    digit = len(projects)

    path = os.path.join(settings.STATIC_PATH, 'refractiveindex/database/library.yml')

    with open(path, 'r') as f:
        library = yaml.load(f)

    new_stack = Stack(project.json, settings.LIBRARY_PATH)

    project.json = json.dumps(project.json)
    library = json.dumps(library)
    return render(request, 'tmm.html', {'project': project, 'form':SaveForm(), 'library':library, 'N':json.dumps(new_stack.N)})

def add_layer(request):
    if request.method == 'POST':
        config = json.loads(request.POST.get('data'))
        path = request.POST.get('path')
        new_stack = Stack(config, settings.LIBRARY_PATH)
        name='no'
        inc = 0
        response_data = {}
        response_data['N'] = json.dumps(new_stack.N)

        print 'OKEY'

        name = get_name(new_stack, path)

        if name:
            ip = get_ip(request)
            log = Log(name=name,path=path, ip=ip).save()
        
        return HttpResponse(
            json.dumps(response_data),
            content_type="application/json"
        )
    else:
        return HttpResponse(
            json.dumps({"nothing to see": "this isn't happening!"}),
            content_type="application/json"
        )

def lib_page(request):
    if request.method == 'POST':
        page_path = os.path.join(settings.LIBRARY_PATH, request.POST.get('data'))

        with open(page_path, 'r') as f:
            page = yaml.load(f)

        #create page object using db
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

    




