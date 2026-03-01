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
  const gap = isMobile ? '4px' : '6px';
  const fontSize = isMobile ? '0.75rem' : '0.85rem';
  const padding = isMobile ? '4px 8px' : '6px 12px';
  const borderRadius = isMobile ? '6px' : '8px';

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap,
    fontSize,
    color: '#fff',
    padding,
    borderRadius,
    textDecoration: 'none',
    fontFamily: 'var(--font-hand)',
    fontWeight: 'bold',
  };

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: isMobile ? undefined : 'center', flexWrap: 'wrap', marginTop: isMobile ? '2px' : undefined }}>
      {nativePurchaseUrl && (
        <motion.a
          href={nativePurchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            ...baseStyle,
            background: 'var(--pop-green)',
            boxShadow: isMobile
              ? '0 2px 4px rgba(151, 235, 169, 0.45)'
              : '0 2px 6px rgba(151, 235, 169, 0.5)',
          }}
        >
          <ShoppingCart size={iconSize} /> {nativeVolumeLabel}
        </motion.a>
      )}

      {enPurchaseUrl && (
        <motion.a
          href={enPurchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            ...baseStyle,
            background: volColor,
            boxShadow: isMobile ? `0 2px 4px ${volColor}40` : `0 2px 6px ${volColor}50`,
          }}
        >
          <ShoppingCart size={iconSize} /> {enVolumeLabel}
        </motion.a>
      )}

      {jpPurchaseUrl && (
        <motion.a
          href={jpPurchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            ...baseStyle,
            background: 'var(--pop-pink)',
            boxShadow: isMobile
              ? '0 2px 4px rgba(255, 158, 198, 0.4)'
              : '0 2px 6px rgba(255, 158, 198, 0.5)',
          }}
        >
          <ShoppingCart size={iconSize} /> {jpVolumeLabel}
        </motion.a>
      )}
    </div>
  );
};

export default VolumePurchaseLinks;
