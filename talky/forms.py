from django.forms import ModelForm
from .models import Talky

class TalkyForm(ModelForm):
    class Meta:
        model = Talky
        fields = ['title', 'description', 'important']