from django.db import models

# Create your models here.

class CarModel(models.Model):
    year = models.CharField(max_length=10)
    brand = models.CharField(max_length=255)
    model = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    desc = models.TextField(default="")
    price = models.FloatField()
    engine = models.IntegerField()
    seats = models.IntegerField()
    image = models.CharField(max_length=255)
    oil_type = models.CharField(max_length=255,default="Petrol")

    def __str__(self) -> str:
        return self.brand+" "+self.model+" ({} Lakh)".format(self.price)
    
    def toJson(self):
        return {
            "id":self.id,
            "year":self.year,
            "brand":self.brand,
            "model":self.model,
            "type":self.type,
            "price":self.price,
            "engine":self.engine,
            "desc":self.desc,
            "seats":self.seats,
            "image":self.image,
        }

    