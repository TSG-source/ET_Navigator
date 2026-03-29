/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface Props {
  size?: number;
  className?: string;
}

export default function ETIcon({ size = 24, className = "" }: Props) {
  return (
    <div 
      className={`bg-et-red flex items-center justify-center text-white font-serif font-bold select-none shrink-0 ${className}`}
      style={{ 
        width: size, 
        height: size, 
        fontSize: size * 0.55,
        borderRadius: size * 0.15
      }}
    >
      ET
    </div>
  );
}
