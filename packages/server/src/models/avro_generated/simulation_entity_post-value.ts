/**
 * A location is defined as a WGS84-based standard representation of a location on
 * earth
 */
export interface ILocation {
  /** In decimal degrees, ranging from [-90, 90] where 0 is the equator */
  latitude: number;
  /**
   * In decimal degrees, ranging from (-180, 180] where 0 is the Prime Meridian
   * (line going through the geographic north, Greenwich, and the geographic south)
   */
  longitude: number;
  /**
   * Optional in meters, where 0 is the surface of the WGS84-based ellipsoid, or
   * another agreed upon common ground level (specified inside the configuration
   * guidelines). A positive number indicates a location outside the ellipsoid (or
   * above the ground level), while a negative number indicates a location inside
   * the ellipsoid (or below the ground level). If an altitude is not provided, it
   * is presumed that the location is at the ground level of the provided latitude
   * and longitude coordinates
   */
  altitude?: null | undefined | number;
}

export interface IHeader {
  /** Sender of the post */
  from: string;
  /**
   * UNIX Epoch time in milliseconds marking the time the post was published/updated
   */
  date: number;
  /** Optional list of recipients of the post */
  to?: null | undefined | string[];
  /** Optional list of recipients in carbon copy of the post */
  cc?: null | undefined | string[];
  /** Optional list of recipients in blind carbon copy of the post */
  bcc?: null | undefined | string[];
  /** Optional subject of the post */
  subject?: null | undefined | string;
  /** Optional introductory text of the post */
  intro?: null | undefined | string;
  /**
   * Optional map of (references to) attachments inside the post: key – unique
   * reference to the attachment (e.g. URI) or complete string-encoded attachment;
   * value – media type of the attachment (e.g. .pdf, .png, .zip)
   */
  attachments?: null | undefined | { [key: string]: string };
  /** Optional location of the sender of the post */
  location?: null | undefined | ILocation;
}

/**
 * A post is a specific entity representing a piece of writing, image or other
 * content published. Examples of posts can range from (e-)mail to social media
 * posts. *Copyright (C) 2019-2020 XVR Simulation B.V., Delft, The Netherlands,
 * Martijn Hendriks <hendriks @ xvrsim.com>. This file is licensed under the MIT
 * license : https://github.com/DRIVER-EU/avro-schemas/blob/master/LICENSE*
 */
export interface IPost {
  /** Unique case-insensitive identifier of the post */
  id: string;
  /** Body text of the post */
  body: string;
  /** Optional header information of the post */
  header?: null | undefined | IHeader;
  /** Optional name of the post */
  name?: null | undefined | string;
  /** Optional type of the post */
  type?: null | undefined | string;
  /**
   * Optional unique case-insensitive identifier of the connected application owning
   * the post
   */
  owner?: null | undefined | string;
  /**
   * Optional UNIX Epoch time in milliseconds marking the time the update was
   * performed
   */
  timestamp?: null | undefined | number;
  /**
   * Optional map containing post specific information: key – unique name of the
   * specific property; value – value of that property
   */
  tags?: null | undefined | { [key: string]: string };
}
