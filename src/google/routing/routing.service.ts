import { RoutesClient } from '@googlemaps/routing';
import { Injectable } from '@nestjs/common';

export interface LocationLatLng {
  location: {
    latLng: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface Address {
  address: string;
}

export interface PlaceId {
  placeId: string;
}

export type CalculatedRoute = Awaited<
  ReturnType<typeof RoutingService.prototype.calculateRoute>
>;

export type Location = LocationLatLng | Address | PlaceId;

@Injectable()
export class RoutingService {
  private routingClient = new RoutesClient();

  async calculateRoute(
    origin: Location,
    destination: Location,
    waypoints?: Location[],
  ) {
    const request: Record<string, any> = {
      origin,
      destination,
    };
    if (waypoints && waypoints.length > 0) {
      request.intermediates = waypoints;
    }
    const response = await this.routingClient.computeRoutes(request, {
      otherArgs: {
        headers: {
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
        },
      },
    });
    return response;
  }
}
