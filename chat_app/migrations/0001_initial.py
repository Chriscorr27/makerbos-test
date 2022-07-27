# Generated by Django 4.0.6 on 2022-07-27 11:09

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CarModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.CharField(max_length=10)),
                ('brand', models.CharField(max_length=255)),
                ('model', models.CharField(max_length=100)),
                ('type', models.CharField(max_length=100)),
                ('price', models.FloatField()),
                ('engine', models.IntegerField()),
                ('seats', models.IntegerField()),
                ('image', models.CharField(max_length=255)),
            ],
        ),
    ]