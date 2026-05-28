from rest_framework import generics, status
from rest_framework.response import Response
from .models import Order
from .serializers import OrderCreateSerializer, OrderDetailSerializer


class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderCreateSerializer
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )
