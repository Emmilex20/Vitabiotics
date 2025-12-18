/**
 * Realistic Tracking Number & URL Generator
 * Generates carrier-specific tracking numbers and tracking URLs
 */

export type CarrierType = 'FedEx' | 'UPS' | 'DHL' | 'Royal Mail' | 'Parcelforce' | 'EasyPost';

interface TrackingDetails {
  trackingNumber: string;
  carrier: CarrierType;
  trackingUrl: string;
}

/**
 * Generate a realistic tracking number based on carrier type
 */
const generateTrackingNumber = (carrier: CarrierType): string => {
  switch (carrier) {
    case 'FedEx':
      // FedEx: 12 digits format
      return Math.floor(Math.random() * 1000000000000)
        .toString()
        .padStart(12, '0');
    
    case 'UPS':
      // UPS: 1Z followed by 16 alphanumeric characters
      const upsChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let upsNum = '1Z';
      for (let i = 0; i < 16; i++) {
        upsNum += upsChars.charAt(Math.floor(Math.random() * upsChars.length));
      }
      return upsNum;
    
    case 'DHL':
      // DHL: 10-11 digits format
      const dhlLen = Math.random() > 0.5 ? 10 : 11;
      return Math.floor(Math.random() * Math.pow(10, dhlLen))
        .toString()
        .padStart(dhlLen, '0');
    
    case 'Royal Mail':
      // Royal Mail: format like RA123456789GB
      const rmChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const rmPrefix = rmChars.charAt(Math.floor(Math.random() * rmChars.length)) +
                      rmChars.charAt(Math.floor(Math.random() * rmChars.length));
      const rmNumber = Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, '0');
      return rmPrefix + rmNumber + 'GB';
    
    case 'Parcelforce':
      // Parcelforce: RN format like RN123456789GB
      const pfNumber = Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, '0');
      return 'RN' + pfNumber + 'GB';
    
    case 'EasyPost':
      // EasyPost: ep_ prefix with UUID-like format
      const uuidSeg = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
      return `ep_${uuidSeg()}_${uuidSeg()}`.toLowerCase();
    
    default:
      // Generic: 12 digit tracking
      return Math.floor(Math.random() * 1000000000000)
        .toString()
        .padStart(12, '0');
  }
};

/**
 * Generate a realistic tracking URL for the carrier
 */
const generateTrackingUrl = (trackingNumber: string, carrier: CarrierType): string => {
  switch (carrier) {
    case 'FedEx':
      return `https://tracking.fedex.com/en/tracking/${trackingNumber}`;
    
    case 'UPS':
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    
    case 'DHL':
      return `https://www.dhl.com/en/en/home/tracking.html?tracking-id=${trackingNumber}`;
    
    case 'Royal Mail':
      return `https://tracking.royalmail.post/en/tracking?number=${trackingNumber}`;
    
    case 'Parcelforce':
      return `https://www.parcelforce.com/tracking?number=${trackingNumber}`;
    
    case 'EasyPost':
      return `https://track.easypost.com/${trackingNumber}`;
    
    default:
      return `https://www.tracking-service.com/?track=${trackingNumber}`;
  }
};

/**
 * Generate complete tracking details with random carrier
 */
export const generateRandomTracking = (): TrackingDetails => {
  const carriers: CarrierType[] = ['FedEx', 'UPS', 'DHL', 'Royal Mail', 'Parcelforce'];
  const carrier = carriers[Math.floor(Math.random() * carriers.length)];
  const trackingNumber = generateTrackingNumber(carrier);
  const trackingUrl = generateTrackingUrl(trackingNumber, carrier);
  
  return { trackingNumber, carrier, trackingUrl };
};

/**
 * Generate tracking details for a specific carrier
 */
export const generateTrackingForCarrier = (carrier: CarrierType): TrackingDetails => {
  const trackingNumber = generateTrackingNumber(carrier);
  const trackingUrl = generateTrackingUrl(trackingNumber, carrier);
  
  return { trackingNumber, carrier, trackingUrl };
};

/**
 * List of supported carriers
 */
export const SUPPORTED_CARRIERS: CarrierType[] = ['FedEx', 'UPS', 'DHL', 'Royal Mail', 'Parcelforce'];
