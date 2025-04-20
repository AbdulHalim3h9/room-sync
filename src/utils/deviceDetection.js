import { db } from "@/firebase";

export const detectDevice = () => {
  const userAgent = navigator.userAgent;
  
  // Basic device type detection
  const isMobile = /Mobile|Android|iPhone|iP[ao]d/.test(userAgent);
  const isTablet = /Tablet|iPad/.test(userAgent);
  const isDesktop = !/Mobile|Android|iPhone|iP[ao]d|Tablet|iPad/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);

  // Device model detection
  const deviceModel = (() => {
    if (isAndroid) {
      const androidModel = userAgent.match(/Android.*?\s([\w\s-]+)\sBuild/);
      return androidModel ? androidModel[1].trim() : 'Unknown Android Device';
    } else if (isIOS) {
      if (/iPhone/.test(userAgent)) {
        const iPhoneModel = userAgent.match(/iPhone\s(\d+)(?:,\d+)?/);
        return iPhoneModel ? `iPhone ${iPhoneModel[1]}` : 'iPhone';
      } else if (/iPad/.test(userAgent)) {
        const iPadModel = userAgent.match(/iPad\s(\d+)(?:,\d+)?/);
        return iPadModel ? `iPad ${iPadModel[1]}` : 'iPad';
      } else if (/iPod/.test(userAgent)) {
        return 'iPod';
      }
    } else {
      const desktopBrowsers = {
        'Chrome': /Chrome\/(\d+)/,
        'Firefox': /Firefox\/(\d+)/,
        'Safari': /Version\/(\d+)/,
        'Edge': /Edg\/(\d+)/,
        'Opera': /OPR\/(\d+)/
      };
      
      for (const [browser, regex] of Object.entries(desktopBrowsers)) {
        const match = userAgent.match(regex);
        if (match) {
          return `${browser} ${match[1]}`;
        }
      }
      return 'Unknown Desktop Browser';
    }
    return 'Unknown Device';
  })();

  // OS version detection
  const osVersion = (() => {
    if (isAndroid) {
      const version = userAgent.match(/Android\s([\d.]+)/);
      return version ? version[1] : 'Unknown Android Version';
    } else if (isIOS) {
      const version = userAgent.match(/OS\s([\d_]+)/);
      return version ? version[1].replace(/_/g, '.') : 'Unknown iOS Version';
    }
    return '';
  })();

  const deviceInfo = {
    isMobile,
    isTablet,
    isDesktop,
    isAndroid,
    isIOS,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent,
    deviceModel,
    osVersion
  };

  return deviceInfo;
};
