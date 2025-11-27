/**
 * TagLink interface for tags associated with entities
 */
export interface TagLink {
  tag: string;
  tagId: number;
  value?: string;
}

/**
 * Display entity representing a Xibo display/player
 */
export interface Display {
  /** The ID of this Display */
  displayId: number;
  
  /** The Display Type ID of this Display */
  displayTypeId?: number;
  
  /** The Venue ID of this Display */
  venueId?: number;
  
  /** The Location Address of this Display */
  address?: string;
  
  /** Is this Display mobile? */
  isMobile?: number;
  
  /** The Languages supported in this display location */
  languages?: string;
  
  /** The type of this Display */
  displayType?: string;
  
  /** The screen size of this Display */
  screenSize?: number;
  
  /** Is this Display Outdoor? */
  isOutdoor?: number;
  
  /** The custom ID (an Id of any external system) of this Display */
  customId?: string;
  
  /** The Cost Per Play of this Display */
  costPerPlay?: number;
  
  /** The Impressions Per Play of this Display */
  impressionsPerPlay?: number;
  
  /** Optional Reference 1 */
  ref1?: string;
  
  /** Optional Reference 2 */
  ref2?: string;
  
  /** Optional Reference 3 */
  ref3?: string;
  
  /** Optional Reference 4 */
  ref4?: string;
  
  /** Optional Reference 5 */
  ref5?: string;
  
  /** Flag indicating whether this Display is recording Auditing Information from XMDS */
  auditingUntil?: number;
  
  /** The Name of this Display */
  display: string;
  
  /** The Description of this Display */
  description?: string;
  
  /** The ID of the Default Layout */
  defaultLayoutId: number;
  
  /** The Display Unique Identifier also called hardware key */
  license: string;
  
  /** A flag indicating whether this Display is licensed or not */
  licensed: number;
  
  /** A flag indicating whether this Display is currently logged in */
  loggedIn?: number;
  
  /** A timestamp in CMS time for the last time the Display accessed XMDS */
  lastAccessed?: number;
  
  /** A flag indicating whether the default layout is interleaved with the Schedule */
  incSchedule: number;
  
  /** A flag indicating whether the Display will send email alerts. */
  emailAlert: number;
  
  /** A timeout in seconds for the Display to send email alerts. */
  alertTimeout?: number;
  
  /** The MAC Address of the Display */
  clientAddress?: string;
  
  /** The media inventory status of the Display */
  mediaInventoryStatus?: number;
  
  /** The current Mac Address of the Player */
  macAddress?: string;
  
  /** A timestamp indicating the last time the Mac Address changed */
  lastChanged?: number;
  
  /** A count of Mac Address changes */
  numberOfMacAddressChanges?: number;
  
  /** A timestamp indicating the last time a WOL command was sent */
  lastWakeOnLanCommandSent?: number;
  
  /** A flag indicating whether Wake On Lan is enabled */
  wakeOnLanEnabled: number;
  
  /** A h:i string indicating the time to send a WOL command */
  wakeOnLanTime?: string;
  
  /** The broad cast address for this Display */
  broadCastAddress?: string;
  
  /** The secureOn WOL settings for this display. */
  secureOn?: string;
  
  /** The CIDR WOL settings for this display */
  cidr?: string;
  
  /** The display Latitude */
  latitude?: number;
  
  /** The display longitude */
  longitude?: number;
  
  /** A string representing the player type */
  clientType?: string;
  
  /** A string representing the player version */
  clientVersion?: string;
  
  /** A number representing the Player version code */
  clientCode?: number;
  
  /** The display settings profile ID for this Display */
  displayProfileId?: number;
  
  /** The current layout ID reported via XMDS */
  currentLayoutId?: number;
  
  /** A flag indicating that a screen shot should be taken by the Player */
  screenShotRequested?: number;
  
  /** The number of bytes of storage available on the device. */
  storageAvailableSpace?: number;
  
  /** The number of bytes of storage in total on the device */
  storageTotalSpace?: number;
  
  /** The ID of the Display Group for this Device */
  displayGroupId?: number;
  
  /** The current layout */
  currentLayout?: string;
  
  /** The default layout */
  defaultLayout?: string;
  
  /** The Player Subscription Channel */
  xmrChannel?: string;
  
  /** The Player Public Key */
  xmrPubKey?: string;
  
  /** The last command success, 0 = failure, 1 = success, 2 = unknown */
  lastCommandSuccess?: number;
  
  /** The Device Name for the device hardware associated with this Display */
  deviceName?: string;
  
  /** The Display Timezone, or empty to use the CMS timezone */
  timeZone?: string;
  
  /** Tags associated with this Display */
  tags?: TagLink[];
  
  /** The display bandwidth limit */
  bandwidthLimit?: number;
  
  /** The new CMS Address */
  newCmsAddress?: string;
  
  /** The new CMS Key */
  newCmsKey?: string;
  
  /** The orientation of the Display, either landscape or portrait */
  orientation?: string;
  
  /** The resolution of the Display expressed as a string in the format WxH */
  resolution?: string;
  
  /** Status of the commercial licence for this Display. 0 - Not licensed, 1 - licensed, 2 - trial licence, 3 - not applicable */
  commercialLicence?: number;
  
  /** The TeamViewer serial number for this Display */
  teamViewerSerial?: string;
  
  /** The Webkey serial number for this Display */
  webkeySerial?: string;
  
  /** A comma separated list of groups/users with permissions to this Display */
  groupsWithPermissions?: string;
  
  /** The datetime this entity was created */
  createdDt?: string;
  
  /** The datetime this entity was last modified */
  modifiedDt?: string;
  
  /** The id of the Folder this Display belongs to */
  folderId?: number;
  
  /** The id of the Folder responsible for providing permissions for this Display */
  permissionsFolderId?: number;
  
  /** The count of Player reported faults */
  countFaults?: number;
  
  /** LAN IP Address, if available on the Player */
  lanIpAddress?: string;
  
  /** The Display Group ID this Display is synced to */
  syncGroupId?: number;
  
  /** The OS version of the Display */
  osVersion?: string;
  
  /** The SDK version of the Display */
  osSdk?: string;
  
  /** The manufacturer of the Display */
  manufacturer?: string;
  
  /** The brand of the Display */
  brand?: string;
  
  /** The model of the Display */
  model?: string;
}

/**
 * Parameters for searching displays
 */
export interface DisplaySearchParams {
  /** Filter by Display Id */
  displayId?: number;
  
  /** Filter by DisplayGroup Id */
  displayGroupId?: number;
  
  /** Filter by Display Name */
  display?: string;
  
  /** Filter by tags */
  tags?: string;
  
  /** A flag indicating whether to treat the tags filter as an exact match */
  exactTags?: number;
  
  /** When filtering by multiple Tags, which logical operator should be used? AND|OR */
  logicalOperator?: string;
  
  /** Filter by Mac Address */
  macAddress?: string;
  
  /** Filter by Hardware Key */
  hardwareKey?: string;
  
  /** Filter by Client Version */
  clientVersion?: string;
  
  /** Filter by Client Type */
  clientType?: string;
  
  /** Filter by Client Code */
  clientCode?: string;
  
  /** Embed related data, namely displaygroups. A comma separated list of child objects to embed. */
  embed?: string;
  
  /** Filter by authorised flag */
  authorised?: number;
  
  /** Filter by Display Profile */
  displayProfileId?: number;
  
  /** Filter by Display Status ( 1 - up to date, 2 - downloading, 3 - Out of date) */
  mediaInventoryStatus?: number;
  
  /** Filter by Logged In flag */
  loggedIn?: number;
  
  /** Filter by Display Last Accessed date, expects date in Y-m-d H:i:s format */
  lastAccessed?: string;
  
  /** Filter by Folder ID */
  folderId?: number;
  
  /** Filter by whether XMR is registed (1 or 0) */
  xmrRegistered?: number;
  
  /** Filter by whether the player is supported (1 or 0) */
  isPlayerSupported?: number;
}

/**
 * Parameters for updating a display
 */
export interface DisplayUpdateParams {
  /** The Display Name */
  display: string;
  
  /** A description of the Display */
  description?: string;
  
  /** A comma separated list of tags for this item */
  tags?: string;
  
  /** A date this Display records auditing information until. */
  auditingUntil?: string;
  
  /** A Layout ID representing the Default Layout for this Display. */
  defaultLayoutId: number;
  
  /** Flag indicating whether this display is licensed. */
  licensed: number;
  
  /** The hardwareKey to use as the licence key for this Display */
  license: string;
  
  /** Flag indicating whether the Default Layout should be included in the Schedule */
  incSchedule: number;
  
  /** Flag indicating whether the Display generates up/down email alerts. */
  emailAlert: number;
  
  /** How long in seconds should this display wait before alerting when it hasn't connected. Override for the collection interval. */
  alertTimeout?: number;
  
  /** Flag indicating if Wake On LAN is enabled for this Display */
  wakeOnLanEnabled: number;
  
  /** A h:i string representing the time that the Display should receive its Wake on LAN command */
  wakeOnLanTime?: string;
  
  /** The BroadCast Address for this Display - used by Wake On LAN */
  broadCastAddress?: string;
  
  /** The secure on configuration for this Display */
  secureOn?: string;
  
  /** The CIDR configuration for this Display */
  cidr?: number;
  
  /** The Latitude of this Display */
  latitude?: number;
  
  /** The Longitude of this Display */
  longitude?: number;
  
  /** The timezone for this display, or empty to use the CMS timezone */
  timeZone?: string;
  
  /** An array of languages supported in this display location */
  languages?: string;
  
  /** The Display Settings Profile ID */
  displayProfileId?: number;
  
  /** The Display Type ID of this Display */
  displayTypeId?: number;
  
  /** The screen size of this Display */
  screenSize?: number;
  
  /** The Venue ID of this Display */
  venueId?: number;
  
  /** The Location Address of this Display */
  address?: string;
  
  /** Is this Display mobile? */
  isMobile?: number;
  
  /** Is this Display Outdoor? */
  isOutdoor?: number;
  
  /** The Cost Per Play of this Display */
  costPerPlay?: number;
  
  /** The Impressions Per Play of this Display */
  impressionsPerPlay?: number;
  
  /** The custom ID (an Id of any external system) of this Display */
  customId?: string;
  
  /** Reference 1 */
  ref1?: string;
  
  /** Reference 2 */
  ref2?: string;
  
  /** Reference 3 */
  ref3?: string;
  
  /** Reference 4 */
  ref4?: string;
  
  /** Reference 5 */
  ref5?: string;
  
  /** Clear all Cached data for this display */
  clearCachedData?: number;
  
  /** Clear the cached XMR configuration and send a rekey */
  rekeyXmr?: number;
  
  /** The TeamViewer serial number for this Display, if applicable */
  teamViewerSerial?: string;
  
  /** The Webkey serial number for this Display, if applicable */
  webkeySerial?: string;
  
  /** Folder ID to which this object should be assigned to */
  folderId?: number;
}
