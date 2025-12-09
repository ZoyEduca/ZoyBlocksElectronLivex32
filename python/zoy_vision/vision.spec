# -*- mode: python ; coding: utf-8 -*-

import sys
import os
from PyInstaller.utils.hooks import collect_all

# --- COLETA DE DADOS DO MEDIAPIPE ---
# O MediaPipe possui arquivos .binarypb e .tflite que não são copiados por padrão.
# A função collect_all busca tudo (datas, binaries, hiddenimports) da biblioteca.
mp_datas, mp_binaries, mp_hiddenimports = collect_all('mediapipe')

# Caminho ABSOLUTO do site-packages do venv (fora da pasta python/)
site_packages = os.path.abspath(
    os.path.join('..', '..', 'venv', 'Lib', 'site-packages')
)

block_cipher = None

a = Analysis(
    ['vision.py'],
    pathex=[os.path.abspath('.')],   # agora estamos dentro de python/zoy_vision/
    binaries=mp_binaries,            # Adiciona binários do MediaPipe
    datas=[
        # Dependências manuais que você já tinha
        (os.path.join(site_packages, 'serial'), 'serial'),
        (os.path.join(site_packages, 'serial/tools'), 'serial/tools'),
        (os.path.join(site_packages, 'serial/urlhandler'), 'serial/urlhandler'),
        (os.path.join(site_packages, 'cv2'), 'cv2'),
        (os.path.join(site_packages, 'numpy'), 'numpy'),
    ] + mp_datas,                    # SOMA (+) com os dados do MediaPipe
    hiddenimports=[
        'serial',
        'serial.tools',
        'serial.tools.list_ports',
        'serial.urlhandler',
        'serial.win32',
        'serial.serialwin32',
        'cv2',
        'cv2.data',
        'numpy',
        'numpy.core._dtype',
        'numpy.core._methods',
        'numpy.core._exceptions',
    ] + mp_hiddenimports,            # SOMA (+) com os imports ocultos do MediaPipe
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# ESTRUTURA LIMPA:
# Removemos a variável 'exe =' separada para evitar criar o executável solto na pasta dist.
# Criamos o EXE() diretamente dentro do COLLECT().

coll = COLLECT(
    EXE(
        pyz,
        a.scripts,
        [], # Binários não vão aqui no modo onedir, vão no COLLECT
        exclude_binaries=True,
        name='vision',
        debug=False,
        bootloader_ignore_signals=False,
        strip=False,
        upx=True,
        console=True,
        disable_windowed_traceback=False,
        argv_emulation=False,
        target_arch=None,
        codesign_identity=None,
        entitlements_file=None,
    ),
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='vision',
)