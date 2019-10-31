# The NEST.JS framework exposes the swagger definition (version 2.0 of OpenApi) at http://localhost:<port>//api-json
Write-Host "Generate typscript REST api client for Mail Server API"
Write-Host "Mail server gateway must be running!"
$url = "http://localhost:7891/api-json"
$SwaggerServerPort = "7891"
$prompt = Read-Host "Open API spec will be downloaded from [$($SwaggerSever)], change or press enter to accept"
if (!$prompt -eq "") {$defaultValue = $prompt}
# $prompt = Read-Host "Open API spec will be downloaded from port [$($SwaggerServerPort)] (the mail-server must be running), change port number or press enter to accept"
# if (!$prompt -eq "") {$SwaggerServerPort = $prompt}

do {
  Write-Host "Check if REST server $($url) is up."
  sleep 3      
} until(Test-NetConnection 127.0.0.1 -Port $SwaggerServerPort | ? { $_.TcpTestSucceeded } )

$message  = 'Docker image'
$question = 'Download docker image "swaggerapi/swagger-codegen-cli"?'
$choices = New-Object Collections.ObjectModel.Collection[Management.Automation.Host.ChoiceDescription]
$choices.Add((New-Object Management.Automation.Host.ChoiceDescription -ArgumentList '&Yes'))
$choices.Add((New-Object Management.Automation.Host.ChoiceDescription -ArgumentList '&No'))
$decision = $Host.UI.PromptForChoice($message, $question, $choices, 1)
if ($decision -eq 0) {
   Write-Host "Download swagger codegen image in docker"
   docker pull swaggerapi/swagger-codegen-cli
} else {
  
}



# show command options
#  docker run swaggerapi/swagger-codegen-cli config-help -l typescript-fetch
# docker run swaggerapi/swagger-codegen-cli help generate

Write-Host "Remove last downloaded OpenApi spec."
$swagger_definition = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath(".\SwaggerDefintion.json")
if (Test-Path $swagger_definition)
{
    Remove-Item $swagger_definition
}

$generateDirectory = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath(".\temp_generated_code")
If(!(test-path $generateDirectory))
{
      New-Item -ItemType Directory -Force -Path $generateDirectory
}

Write-Host "Downloaded OpenApi spec. from url '$($url)'."

$ErrorCode = Invoke-WebRequest $url -OutFile "SwaggerDefintion.json"
if ($?){
   Write-Host "Generate TypeScript FETCH api client"
   # /opt/swagger-codegen
   docker run -v ${PWD}:/mounted swaggerapi/swagger-codegen-cli generate  -i /mounted/SwaggerDefintion.json -l typescript-fetch -o /mounted/generated_code -c /mounted/swagger-config.json
   Write-Host "Copy generated files to project"

   $executingScriptDirectory = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
   $source = resolve-path ".\generated_code\*.ts"
   $destination = resolve-path ".\..\src\generated_rest_api\"
   # TODO Clean old generated files
   Write-Host "Copy from $source"
   Write-Host "Copy from $destination"
   Copy-Item $source -Destination $destination -Force -Recurse -Verbose
   Write-Host "Generated swagger code in ($destination)"
} else {
	Write-Host "Failed to download SwaggerDefintion at $Url"
}

# Write-Host "Press any key to continue "
# $x = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

