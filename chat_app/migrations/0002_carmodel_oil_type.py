# Generated by Django 4.0.6 on 2022-07-27 16:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='carmodel',
            name='oil_type',
            field=models.CharField(default='Petrol', max_length=255),
        ),
    ]