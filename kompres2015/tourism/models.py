from django.db import models

from ckeditor.fields import RichTextField

from kompres2015.util.models import TimeStampedModel
from kompres2015.region.models import District
from kompres2015.users.models import User


class Transportation(TimeStampedModel):
    name = models.CharField(max_length=40)


class TravelDestination(TimeStampedModel):
    name = models.CharField(max_length=30, unique=True)
    district = models.ForeignKey(District, verbose_name='Kabupaten',
                                 related_name='travel_destinations',
                                 blank=True, null=True)
    full_description = RichTextField(verbose_name='Deskripsi lengkap',
                                     blank=True, null=True)
    tagline = models.CharField(verbose_name='Deskripsi Singkat/Tagline',
                               max_length=100, blank=True, null=True)

    class Meta:
        verbose_name = 'Lokasi Wisata'

    def __str__(self):
        return self.name


class TravelDestinationContent(TimeStampedModel):
    name = models.CharField(max_length=30)
    content = RichTextField()
    travel_destination = models.ForeignKey(TravelDestination, related_name='contents')

    class Meta:
        verbose_name = 'Konten Lokasi Wisata'

    def __str__(self):
        return self.name


class Visit(TimeStampedModel):
    travel_destination = models.ForeignKey(TravelDestination, related_name='visits')
    user = models.ForeignKey(User)

    class Meta:
        verbose_name = 'Kunjungan'
        unique_together = ('creation_date', 'travel_destination', 'user')

    def __str__(self):
        return str(self.created_date) + ' ' + self.user.name + ' ' + self.travel_destination.name


class Report(TimeStampedModel):
    CATEGORY_CHOICES = (
        ('keamanan', 'keamanan'),
        ('kebersihan', 'kebersihan'),
        ('kenyamanan', 'kenyamanan'),
        ('lainnya', 'lainnya'),
    )
    category = models.CharField(verbose_name="Kategori", max_length=30,
                                choices=CATEGORY_CHOICES)
    report = models.TextField(verbose_name='Isi komplain')
    user = models.ForeignKey(User)
    travel_destination = models.ForeignKey(TravelDestination)

    class Meta:
        verbose_name = 'Komplain pengunjung'

    def __str__(self):
        return self.user.name + ' ' + self.travel_destination.name




