from django.shortcuts import render
from django.http import HttpResponse
from tmm.models import Project
from tmm.forms import SaveForm
import json

def home(request):
    projects = Project.objects.all()
    project = projects[0]
    digit = len(projects)
    
    project.json = json.dumps(project.json)
    

    return render(request, 'tmm.html', {'project': project, 'form':SaveForm()})

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


