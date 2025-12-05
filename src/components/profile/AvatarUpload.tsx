/**
 * Avatar Upload with Circular Crop
 * Componente para upload e crop de avatar com preview circular
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../common';
import './AvatarUpload.css';

// Helper para debug logs (apenas em desenvolvimento)
const debugLog = (...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    debugLog(...args);
  }
};

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
  const [_selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || '');
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');
  const [step, setStep] = useState<'select' | 'crop' | 'preview'>('select');
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, scale: 1 });
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
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
  const _MAX_DIMENSION = 4096; // 4096x4096 pixels máximo (padrão web)
  const CROP_SIZE = 280; // Tamanho da área de crop

  // Calcular zoom mínimo para cobrir toda área de crop
  const _calculateMinZoom = (imgWidth: number, imgHeight: number): number => {
    // Zoom mínimo é o necessário para que a imagem cubra toda a área de crop
    const minZoomWidth = CROP_SIZE / imgWidth;
    const minZoomHeight = CROP_SIZE / imgHeight;
    const calculatedMinZoom = Math.max(minZoomWidth, minZoomHeight);
    
    debugLog('📏 Dimensões da imagem:', imgWidth, 'x', imgHeight);
    debugLog('📐 Zoom mínimo calculado:', calculatedMinZoom.toFixed(2));
    
    return Math.max(0.1, calculatedMinZoom); // Mínimo absoluto de 0.1
  };

  // Calcular zoom máximo baseado no tamanho da imagem
  const _calculateMaxZoom = (imgWidth: number, imgHeight: number): number => {
    // Para imagens pequenas, permitir mais zoom
    // Para imagens grandes, limitar o zoom
    const avgDimension = (imgWidth + imgHeight) / 2;
    
    if (avgDimension <= 300) return 5;      // Imagens pequenas: até 500%
    if (avgDimension <= 600) return 4;      // Imagens médias: até 400%
    if (avgDimension <= 1200) return 3;     // Imagens grandes: até 300%
    return 2;                                // Imagens muito grandes: até 200%
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    debugLog('📁 Arquivo selecionado:', file.name, file.type, file.size, 'bytes');
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

    // Limpar preview anterior se existir
    if (previewUrl && previewUrl !== currentAvatar) {
      URL.revokeObjectURL(previewUrl);
    }

    // Validar dimensões
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    debugLog('🖼️ Blob URL criada:', objectUrl);

    img.onload = () => {
      debugLog('✅ Imagem carregada:', img.width, 'x', img.height, 'pixels');
      
      if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
        setError(`Imagem muito pequena. Mínimo: ${MIN_DIMENSION}x${MIN_DIMENSION}px`);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      // Tudo OK - definir arquivo e preview
      debugLog('✅ Definindo arquivo e preview URL');
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setStep('crop');
      setCrop({ x: 0, y: 0, scale: 1 });
    };

    img.onerror = () => {
      debugLog('❌ Erro ao carregar imagem');
      setError('Erro ao carregar imagem');
      URL.revokeObjectURL(objectUrl);
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

    const _container = containerRef.current.getBoundingClientRect();
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

  // Cleanup: limpar URLs ao desmontar
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== currentAvatar && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, currentAvatar]);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setCrop(prev => ({ ...prev, scale: newScale }));
  };

  const getCroppedImage = (): Promise<string> => {
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

      // Converter para blob e criar URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.9);
    });
  };

  // Função para recortar imagem (Etapa 1: Crop)
  const handleCropImage = async () => {
    debugLog('✂️ Iniciando recorte da imagem...');
    setLoading(true);
    setError('');

    try {
      const croppedUrl = await getCroppedImage();
      debugLog('✅ Imagem recortada com sucesso:', croppedUrl.substring(0, 50) + '...');
      setCroppedImageUrl(croppedUrl);
      setStep('preview');
    } catch (err) {
      debugLog('❌ Erro ao recortar imagem:', err);
      setError('Erro ao recortar imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para escolher nova imagem
  const handleChooseNew = () => {
    debugLog('🔄 Escolhendo nova imagem...');
    
    // Limpar URLs anteriores
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    if (croppedImageUrl && croppedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(croppedImageUrl);
    }
    
    setSelectedFile(null);
    setPreviewUrl('');
    setCroppedImageUrl('');
    setStep('select');
    setCrop({ x: 0, y: 0, scale: 1 });
    setMinZoom(1);
    setMaxZoom(3);
    setImageDimensions({ width: 0, height: 0 });
    setError('');
  };

  // Função para salvar avatar (Etapa 2: Preview)
  const handleSave = async () => {
    debugLog('💾 Tentando salvar avatar...');
    
    if (!croppedImageUrl) {
      debugLog('⚠️ Nenhuma imagem recortada');
      setError('Recorte a imagem primeiro');
      return;
    }

    setLoading(true);
    setError('');

    try {
      debugLog('🔄 Convertendo imagem recortada para base64...');
      
      // Converter blob URL para base64
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      debugLog('✅ Base64 gerado:', base64String.substring(0, 50) + '...');

      // Salvar no localStorage
      localStorage.setItem('user_avatar', base64String);
      debugLog('💾 Avatar salvo no localStorage');

      // Limpar URLs temporárias
      if (croppedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(croppedImageUrl);
      }
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      // Chamar callback
      onSave(base64String);
      debugLog('📡 Callback onSave chamado');

      // Fechar modal
      onClose();
      debugLog('✅ Modal fechado');
    } catch (err) {
      debugLog('❌ Erro ao salvar avatar:', err);
      setError('Erro ao salvar imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avatar-upload-overlay">
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
          {step === 'select' && (
            // Etapa 1: Upload inicial
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
          )}

          {step === 'crop' && previewUrl && (
            // Etapa 2: Editor de crop
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
                  onLoad={(e) => {
                    debugLog('✅ Imagem carregada com sucesso:', previewUrl);
                    const img = e.currentTarget;
                    const imgWidth = img.naturalWidth;
                    const imgHeight = img.naturalHeight;
                    
                    // Calcular zoom mínimo para caber na área de crop
                    const minZoomWidth = CROP_SIZE / imgWidth;
                    const minZoomHeight = CROP_SIZE / imgHeight;
                    const calculatedMinZoom = Math.max(minZoomWidth, minZoomHeight);
                    
                    // Calcular zoom máximo baseado no tamanho
                    const avgDimension = (imgWidth + imgHeight) / 2;
                    let calculatedMaxZoom = 3;
                    if (avgDimension <= 300) calculatedMaxZoom = 5;
                    else if (avgDimension <= 600) calculatedMaxZoom = 4;
                    else if (avgDimension <= 1200) calculatedMaxZoom = 3;
                    else calculatedMaxZoom = 2;
                    
                    setImageDimensions({ width: imgWidth, height: imgHeight });
                    setMinZoom(calculatedMinZoom);
                    setMaxZoom(calculatedMaxZoom);
                    
                    // Definir zoom inicial como minZoom (imagem cabe perfeitamente)
                    setCrop({ x: 0, y: 0, scale: calculatedMinZoom });
                    
                    debugLog('📏 Dimensões:', imgWidth, 'x', imgHeight);
                    debugLog('🔍 Zoom mínimo:', calculatedMinZoom.toFixed(2));
                    debugLog('🔍 Zoom máximo:', calculatedMaxZoom);
                  }}
                  onError={(e) => {
                    debugLog('❌ Erro ao carregar imagem:', e);
                    setError('Erro ao carregar imagem. Tente novamente.');
                  }}
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
                  min={minZoom}
                  max={maxZoom}
                  step="0.01"
                  value={crop.scale}
                  onChange={handleZoomChange}
                  className="zoom-slider"
                />
                <span className="zoom-value">
                  {Math.round((crop.scale / minZoom) * 100)}%
                </span>
              </div>

              <p className="zoom-info">
                📏 Imagem: {imageDimensions.width}×{imageDimensions.height}px | 
                Zoom: {minZoom.toFixed(2)}x - {maxZoom}x
              </p>

              <p className="crop-help">
                📏 Imagem: {imageDimensions.width}×{imageDimensions.height}px | 
                Zoom: {minZoom.toFixed(2)}x - {maxZoom}x
              </p>

              <p className="crop-help">
                🖱️ Arraste a imagem para posicionar | 🔍 Use o controle para dar zoom
              </p>
            </div>
          )}

          {step === 'preview' && croppedImageUrl && (
            // Etapa 3: Preview da imagem recortada
            <div className="preview-zone">
              <h3>Pré-visualização</h3>
              <div className="preview-avatar">
                <img src={croppedImageUrl} alt="Avatar recortado" />
              </div>
              <p className="preview-help">
                Esta será sua nova foto de perfil
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step === 'crop' && (
            <>
              <Button 
                variant="secondary" 
                onClick={handleChooseNew}
                disabled={loading}
              >
                Escolher Outra
              </Button>
              <Button 
                onClick={handleCropImage} 
                loading={loading}
              >
                ✂️ Recortar Imagem
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button 
                variant="secondary" 
                onClick={handleChooseNew}
                disabled={loading}
              >
                Escolher Nova Imagem
              </Button>
              <Button 
                onClick={handleSave} 
                loading={loading}
              >
                💾 Salvar Avatar
              </Button>
            </>
          )}

          {step === 'select' && (
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
