import { Feather } from "@expo/vector-icons";
import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";
import LeftActivity from "./assets/left-activity.svg";
import LeftArchive from "./assets/left-archive.svg";
import LeftArrowLeft from "./assets/left-arrow-left.svg";
import LeftArrowUpRight from "./assets/left-arrow-up-right.svg";
import LeftCheck from "./assets/left-check.svg";
import LeftChevronDown from "./assets/left-chevron-down.svg";
import LeftChevronRight from "./assets/left-chevron-right.svg";
import LeftClock from "./assets/left-clock.svg";
import LeftEdit from "./assets/left-edit.svg";
import LeftEyeActive from "./assets/left-eye-active.svg";
import LeftEyeOff from "./assets/left-eye-off.svg";
import LeftEye from "./assets/left-eye.svg";
import LeftHomeActive from "./assets/left-home-active.svg";
import LeftHome from "./assets/left-home.svg";
import LeftLock from "./assets/left-lock.svg";
import LeftMapPinActive from "./assets/left-map-pin-active.svg";
import LeftMapPin from "./assets/left-map-pin.svg";
import LeftMinus from "./assets/left-minus.svg";
import LeftRadioActive from "./assets/left-radio-active.svg";
import LeftRadio from "./assets/left-radio.svg";
import LeftShield from "./assets/left-shield.svg";
import LeftUserActive from "./assets/left-user-active.svg";
import LeftUser from "./assets/left-user.svg";
import LeftUsers from "./assets/left-users.svg";
import LeftVenueActive from "./assets/left-venue-active.svg";
import LeftVenue from "./assets/left-venue.svg";

type FeatherIconName = keyof typeof Feather.glyphMap;
type SvgIconComponent = ComponentType<SvgProps>;

const leftIcons = {
  activity: LeftActivity,
  archive: LeftArchive,
  "arrow-left": LeftArrowLeft,
  "arrow-up-right": LeftArrowUpRight,
  check: LeftCheck,
  "chevron-down": LeftChevronDown,
  "chevron-right": LeftChevronRight,
  clock: LeftClock,
  edit: LeftEdit,
  eye: LeftEye,
  "eye-off": LeftEyeOff,
  home: LeftHome,
  lock: LeftLock,
  "map-pin": LeftMapPin,
  minus: LeftMinus,
  radio: LeftRadio,
  shield: LeftShield,
  user: LeftUser,
  users: LeftUsers,
  venue: LeftVenue,
} as const satisfies Record<string, SvgIconComponent>;

const leftActiveIcons = {
  eye: LeftEyeActive,
  home: LeftHomeActive,
  "map-pin": LeftMapPinActive,
  radio: LeftRadioActive,
  user: LeftUserActive,
  venue: LeftVenueActive,
} as const satisfies Partial<Record<keyof typeof leftIcons, SvgIconComponent>>;

export type LeftBrandIconName = keyof typeof leftIcons;
export type LeftIconName = LeftBrandIconName | FeatherIconName;

export function isLeftBrandIcon(name: LeftIconName): name is LeftBrandIconName {
  return name in leftIcons;
}

export function LeftIcon({
  name,
  size = 24,
  color = "#000000",
  active = false,
}: {
  name: LeftIconName;
  size?: number;
  color?: string;
  active?: boolean;
}) {
  if (isLeftBrandIcon(name)) {
    const activeIcon = Object.prototype.hasOwnProperty.call(leftActiveIcons, name)
      ? leftActiveIcons[name as keyof typeof leftActiveIcons]
      : undefined;
    const IconComponent = (active ? activeIcon : undefined) ?? leftIcons[name];
    return <IconComponent width={size} height={size} color={color} />;
  }

  return <Feather name={name} size={size} color={color} />;
}
