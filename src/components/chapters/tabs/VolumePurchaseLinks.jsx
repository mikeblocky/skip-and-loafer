import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
 
const VolumePurchaseLinks = ({
  isMobile = false,
  volColor,
  nativePurchaseUrl,
  nativeVolumeLabel,
  enPurchaseUrl,
  enVolumeLabel,
  jpPurchaseUrl,
  jpVolumeLabel,
}) => {
  const iconSize = isMobile ? 12 : 14;
  const gap = isMobile ? '6px' : '8px';
  const fontSize = isMobile ? '0.75rem' : '0.8rem';
  const padding = isMobile ? '6px 12px' : '8px 16px';
  const borderRadius = isMobile ? '10px' : '12px';
 
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap,
    fontSize,
    color: '#fff',
    padding,
    borderRadius,
    textDecoration: 'none',
    fontFamily: 'var(--font-main)',
    fontWeight: '900',
    transition: 'all 0.1s ease',
  };
 
  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: isMobile ? '4px' : '8px' }}>
      {nativePurchaseUrl && (
        <motion.a
          href={nativePurchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95, y: 3 }}
          style={{
            ...baseStyle,
            background: 'var(--pop-green)',
            border: '2px solid #059669',
            borderBottom: '4px solid #057850',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
          }}
        >
          <ShoppingCart size={iconSize} strokeWidth={3} /> {nativeVolumeLabel}
        </motion.a>
      )}
 
      {enPurchaseUrl && (
        <motion.a
          href={enPurchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95, y: 3 }}
          style={{
            ...baseStyle,
            background: volColor,
            border: `2px solid rgba(0,0,0,0.15)`,
            borderBottom: `4px solid rgba(0,0,0,0.25)`,
            boxShadow: `0 4px 12px ${volColor}30`,
          }}
        >
          <ShoppingCart size={iconSize} strokeWidth={3} /> {enVolumeLabel}
        </motion.a>
      )}
 
      {jpPurchaseUrl && (
        <motion.a
          href={jpPurchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95, y: 3 }}
          style={{
            ...baseStyle,
            background: 'var(--pop-pink)',
            border: '2px solid #db2777',
            borderBottom: '4px solid #be185d',
            boxShadow: '0 4px 12px rgba(219, 39, 119, 0.2)',
          }}
        >
          <ShoppingCart size={iconSize} strokeWidth={3} /> {jpVolumeLabel}
        </motion.a>
      )}
    </div>
  );
};
 
export default VolumePurchaseLinks;
