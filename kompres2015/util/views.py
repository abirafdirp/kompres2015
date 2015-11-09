from rest_framework import viewsets
from rest_framework import mixins

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


class CreateListRetrieveViewSet(mixins.CreateModelMixin,
                                mixins.RetrieveModelMixin,
                                mixins.ListModelMixin,
                                viewsets.GenericViewSet):
    pass


@api_view(('GET',))
def api_root(request, format=None):
    return Response({
        'regions': reverse('region-list', request=request, format=format),
        'provinces': reverse('province-list', request=request, format=format),
        'districts': reverse('district-list', request=request, format=format),
        'travel destinations': reverse('travel-destination-list', request=request, format=format),
        'visits': reverse('visit-list', request=request, format=format),
        'reports': reverse('report-list', request=request, format=format),
        'users': reverse('user-list', request=request, format=format),
        'images': reverse('user-list', request=request, format=format),
        'report images': reverse('report-image-list', request=request, format=format),
        'travel destination main images': reverse('travel-destination-main-image-list', request=request, format=format),
        'travel destination what to do images': reverse('travel-destination-what-to-do-image-list', request=request, format=format),
        'travel destination gallery images': reverse('travel-destination-gallery-image-list', request=request, format=format),
        'home page': reverse('home-page-list', request=request, format=format),
    })