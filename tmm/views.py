from django.shortcuts import render
from django.http import HttpResponse
from tmm.models import Project
from tmm.forms import SaveForm
import json
import yaml
import os
from django.conf import settings
import db
import numpy as np
from scipy import interpolate

def N_interp(repo, wlRange):
    N = {}
    N['x'] = np.linspace(min(wlRange), max(wlRange), 50)
    for item in repo.keys():
        n = np.array(repo.get(item).get('n', None))
        k = np.array(repo.get(item).get('k'))
        try:
            len(k)
        except:
            k = np.array([0]*(len(n)))
        x = np.array(repo.get(item).get('x'))
        fn = interpolate.interp1d(x, n)
        fk = interpolate.interp1d(x, k)
        N[item] = {'n': list(fn(N.get('x'))), 'k': list(fk(N.get('x')))}
    N['x'] = list(N['x'])
    return N

def get_limits(repo):
    mins = []
    maxs = []
    keys = repo.keys()
    for item in keys:
        mins.append(min(repo.get(item).get('x')))
        maxs.append(max(repo.get(item).get('x')))
    return [max(mins), min(maxs)]

def get_paths(json, nRepo):
    if json.get('path', None):
        stub = json.get('path')
        if nRepo.get(json.get('path'), None):
            next
        else:
            path = os.path.join(settings.LIBRARY_PATH, stub)
            page_data = db.L(path.replace('!!', ' ')).grabData()
            nRepo[stub] = page_data
    else:
        for item in json:
            if isinstance(json.get(item), dict):
                try:
                    get_paths(json.get(item), nRepo)
                except:
                    continue
            elif isinstance(json.get(item), list):
                for item in json.get(item):
                    get_paths(item, nRepo)
    

def home(request):
    projects = Project.objects.all()
    project = projects[0]
    digit = len(projects)

    path = os.path.join(settings.STATIC_PATH, 'refractiveindex/database/library.yml')

    with open(path, 'r') as f:
        library = yaml.load(f)

    nRepo = {}
    get_paths(project.json, nRepo)
    wlRange = get_limits(nRepo)
    print wlRange
    N = N_interp(nRepo, wlRange)

    project.json = json.dumps(project.json)
    library = json.dumps(library)

    
    
    return render(request, 'tmm.html', {'project': project, 'form':SaveForm(), 'library':library, 'N':json.dumps(N)})

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

    




