from django.contrib import admin
from .models import Talky

# Register your models here.
class TalkyAdmin(admin.ModelAdmin):
  readonly_fields = ('created', )

admin.site.register(Talky, TalkyAdmin)