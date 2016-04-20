from django import forms
from tmm.models import Project

class SaveForm(forms.ModelForm):
    class Meta:
        model = Project

