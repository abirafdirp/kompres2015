from rest_framework import serializers

from kompres2015.tourism.models import TravelDestination
from kompres2015.tourism.models import Visit
from kompres2015.tourism.models import Report

from kompres2015.util.custom_serializer_fields import Base64ImageField


class TravelDestinationSerializer(serializers.HyperlinkedModelSerializer):
    district = serializers.HyperlinkedRelatedField(view_name='district-detail',
                                                   read_only=True)
    visits = serializers.HyperlinkedRelatedField(view_name='visit-detail',
                                                 read_only=True, many=True)

    def __init__(self, *args, **kwargs):
        # Instantiate the superclass normally
        super(TravelDestinationSerializer, self).__init__(*args, **kwargs)

        fields = self.context['request'].query_params.get('fields')
        if fields:
            fields = fields.split(',')
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields.keys())
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    class Meta:
        model = TravelDestination
        fields = ('id', 'name', 'district', 'full_description', 'tagline', 'what_to_do',
                  'transport_method', 'where_to_stay', 'important_info_contact',
                  'visits')


class VisitSerializer(serializers.HyperlinkedModelSerializer):
    travel_destination = serializers.HyperlinkedRelatedField(view_name='travel-destination-detail',
                                                             read_only=True)

    class Meta:
        model = Visit
        fields = ('id', 'created_date', 'travel_destination', 'user')


class ReportSerializer(serializers.HyperlinkedModelSerializer):
    # image = Base64ImageField(max_length=None, use_url=True,)

    class Meta:
        model = Report
        fields = ('id', 'category', 'report', 'user')

