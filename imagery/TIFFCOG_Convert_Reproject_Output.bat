@echo off

REM code to process the GeoTIFF to Cloud-Optimized GeoTIFF
for %%F in (*.tif) do (
    REM Convert to COG GeoTIFF
    gdal_translate -co "TILED=YES" -co "COPY_SRC_OVERVIEWS=YES" "%%F" "%%~nF_cog.tif"
        
REM Reproject the COG GeoTIFF
    gdalwarp -s_srs "EPSG:3857" -t_srs "EPSG:3857" -r bilinear "%%~nF_cog.tif" "%%~nF_cog_web_mercator.tif"
)