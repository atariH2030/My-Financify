/**
 * Avatar Upload with Circular Crop
 * Componente para upload e crop de avatar com preview circular
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../common';
import './AvatarUpload.css';

interface AvatarUploadProps {
  onClose: () => void;
  onSave: (avatarUrl: string) => void;
  currentAvatar?: string;
}

interface CropState {
  x: number;
  y: number;
  scale: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ onClose, onSave, currentAvatar }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || '');
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limites de tamanho
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const MIN_DIMENSION = 200; // 200x200 pixels mínimo
  const CROP_SIZE = 280; // Tamanho da área de crop

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validar tipo
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      setError('Formato inválido. Use JPG ou PNG');
      return;
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      setError('Arquivo muito grande. Máximo: 2MB');
      return;
    }

    // Validar dimensões
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
        setError(`Imagem muito pequena. Mínimo: ${MIN_DIMENSION}x${MIN_DIMENSION}px`);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setCrop({ x: 0, y: 0, scale: 1 });
    };

    img.src = objectUrl;
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y,
    });
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current || !imageRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const image = imageRef.current;
    const scaledWidth = image.naturalWidth * crop.scale;
    const scaledHeight = image.naturalHeight * crop.scale;

    // Calcular nova posição
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    // Limites para não arrastar além da imagem
    const maxX = 0;
    const minX = CROP_SIZE - scaledWidth;
    const maxY = 0;
    const minY = CROP_SIZE - scaledHeight;

    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    setCrop(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, crop.scale]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners para drag
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setCrop(prev => ({ ...prev, scale: newScale }));
  };

  const getCroppedImage = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imageRef.current) {
        reject(new Error('No image'));
        return;
      }

      const image = imageRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No canvas context'));
        return;
      }

      // Canvas de saída (quadrado)
      const outputSize = 400; // 400x400 pixels de saída
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Calcular posição da imagem no crop
      const scaledWidth = image.naturalWidth * crop.scale;
      const scaledHeight = image.naturalHeight * crop.scale;
      
      // Proporção entre crop visual e dimensão real
      const cropRatio = outputSize / CROP_SIZE;

      // Desenhar imagem cortada
      ctx.drawImage(
        image,
        0, 0,
        image.naturalWidth, image.naturalHeight,
        crop.x * cropRatio, crop.y * cropRatio,
        scaledWidth * cropRatio, scaledHeight * cropRatio
      );

      // Converter para blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    if (!selectedFile) {
      onSave(currentAvatar || '');
      onClose();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const croppedBlob = await getCroppedImage();
      
      // TODO: Upload para Supabase Storage
      // const { data, error } = await supabase.storage
      //   .from('avatars')
      //   .upload(`${user.id}/avatar.jpg`, croppedBlob);

      // Converter blob para base64 para salvar no localStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Salvar no localStorage temporariamente
        localStorage.setItem('user_avatar', base64);
        onSave(base64);
      };
      reader.readAsDataURL(croppedBlob);
      
      // Simular delay de upload
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError('Erro ao processar imagem');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avatar-upload-overlay" onClick={onClose}>
      <div className="avatar-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Foto de Perfil</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="upload-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <div className="modal-content">
          {!previewUrl ? (
            // Upload inicial
            <div className="upload-zone">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <div className="upload-icon">📷</div>
              <h3>Escolha uma Foto</h3>
              <p>JPG ou PNG, máximo 2MB</p>
              <p className="upload-min">Mínimo: 200x200 pixels</p>
              
              <Button onClick={() => fileInputRef.current?.click()}>
                Selecionar Arquivo
              </Button>
            </div>
          ) : (
            // Editor de crop
            <div className="crop-editor">
              <div className="crop-container" ref={containerRef}>
                {/* Imagem com transformações */}
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  className="crop-image"
                  style={{
                    transform: `translate(${crop.x}px, ${crop.y}px) scale(${crop.scale})`,
                    cursor: isDragging ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={handleDragStart}
                  draggable={false}
                />
                
                {/* Overlay escuro com máscara circular */}
                <div className="crop-overlay">
                  <svg width={CROP_SIZE} height={CROP_SIZE}>
                    <defs>
                      <mask id="crop-mask">
                        <rect width="100%" height="100%" fill="white" />
                        <circle cx={CROP_SIZE / 2} cy={CROP_SIZE / 2} r={CROP_SIZE / 2} fill="black" />
                      </mask>
                    </defs>
                    <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#crop-mask)" />
                  </svg>
                </div>

                {/* Círculo de referência */}
                <div className="crop-circle" />
              </div>

              {/* Controles de Zoom */}
              <div className="zoom-controls">
                <span className="zoom-label">🔍</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={crop.scale}
                  onChange={handleZoomChange}
                  className="zoom-slider"
                />
                <span className="zoom-value">{Math.round(crop.scale * 100)}%</span>
              </div>

              <p className="crop-help">
                🖱️ Arraste a imagem para posicionar | 🔍 Use o controle para dar zoom
              </p>

              <Button
                variant="secondary"
                onClick={() => {
                  setPreviewUrl('');
                  setSelectedFile(null);
                  setCrop({ x: 0, y: 0, scale: 1 });
                }}
                fullWidth
              >
                Escolher Outra Foto
              </Button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} loading={loading} disabled={!previewUrl && !currentAvatar}>
            {selectedFile ? '✂️ Recortar e Salvar' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
