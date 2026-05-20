// Для react-native-svg (исправленная версия)
declare module 'react-native-svg' {
  import React from 'react';
  import { ViewStyle } from 'react-native';
  
  export interface SvgProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    style?: ViewStyle;
    color?: string;
    title?: string;
    children?: React.ReactNode;
  }
  
  export interface CircleProps {
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeDasharray?: number | string;
    strokeDashoffset?: number | string;
    strokeLinecap?: 'butt' | 'round' | 'square';
    transform?: string;
    rotation?: number | string;
    origin?: number | string;
    opacity?: number;
    children?: React.ReactNode;
  }
  
  export interface RectProps {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    rx?: number | string;
    ry?: number | string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    transform?: string;
    children?: React.ReactNode;
  }
  
  export interface GProps {
    children?: React.ReactNode;
    transform?: string;
    rotation?: number | string;
    origin?: number | string;
  }
  
  export interface PathProps {
    d?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    transform?: string;
    children?: React.ReactNode;
  }
  
  export interface TextProps {
    x?: number | string;
    y?: number | string;
    fill?: string;
    fontSize?: number | string;
    textAnchor?: 'start' | 'middle' | 'end';
    children?: React.ReactNode;
  }
  
  export class Svg extends React.Component<SvgProps> {}
  export class Circle extends React.Component<CircleProps> {}
  export class Rect extends React.Component<RectProps> {}
  export class G extends React.Component<GProps> {}
  export class Path extends React.Component<PathProps> {}
  export class Text extends React.Component<TextProps> {}
  
  // Добавьте другие компоненты по необходимости
  export const Line: React.ComponentClass<any>;
  export const Polygon: React.ComponentClass<any>;
  export const Polyline: React.ComponentClass<any>;
  export const Ellipse: React.ComponentClass<any>;
  export const Defs: React.ComponentClass<any>;
  export const LinearGradient: React.ComponentClass<any>;
  export const Stop: React.ComponentClass<any>;
  export const ClipPath: React.ComponentClass<any>;
}

// Для SVG-файлов
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Для react-native-base64
declare module 'react-native-base64' {
  const base64: {
    encode(input: string): string;
    decode(input: string): string;
    encodeFromByteArray(input: Uint8Array | number[]): string;
  };
  export default base64;
}
