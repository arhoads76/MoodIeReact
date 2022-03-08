@echo off
echo.
dir /b dist\*.js > files.txt

set build_path=..
if "%1"=="dev" (
	set build_path=dist\dev
) else if "%1"=="release" (
	set build_path=dist\release
)

set copied=false
for /f %%i in (files.txt) do (
	if not exist "%build_path%\%%i" (
		echo New: %%i & xcopy /y /q ".\dist\%%i" "%build_path%\" > nul & set copied=true
	) else if exist "D:\tools\Beyond Compare 4\bcomp.com" (
		"D:\tools\Beyond Compare 4\bcomp" /qc ".\dist\%%i" "%build_path%\%%i" > nul
		if errorlevel 11 echo Copying %%i & xcopy /y /q ".\dist\%%i" "%build_path%\" > nul & set copied=true
	) else  (
		fc /b ".\dist\%%i" "%build_path%\%%i" > nul
		if errorlevel 1 echo Copying %%i & xcopy /y /q ".\dist\%%i" "%build_path%\" > nul & set copied=true
	)
	if not "%build_path%"==".." xcopy /y /q "%build_path%\%%i" ".\wwwroot\js\" > nul
)

echo.
if "%copied%"=="false" echo Nothing changed
if not "%copied%"=="false" echo Finished copying changes

del files.txt
