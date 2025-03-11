from django.apps import AppConfig

class TalkyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'talky'  # ← ¡Este nombre debe coincidir con el path correcto!
