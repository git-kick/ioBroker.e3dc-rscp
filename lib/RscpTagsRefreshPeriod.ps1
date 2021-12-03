$json = Get-Content ./RscpTags.json | ConvertFrom-Json
foreach( $tag in (Get-Member -InputObject $json -MemberType NoteProperty).Name ) {
    if( $json.$tag.RefreshPeriod -ne "" ) { 
        # "$($json.$tag.TagNameGlobal) -- $($json.$tag.RefreshPeriod)"
        switch( $json.$tag.RefreshPeriod ) {
            "short" { $sml = "S" }
            "medium" { $sml = "M" }
            "long" { $sml = "L" }
            "default" { $sml = "X" }
        }
        "{"
        "`t`"tag`": `"$($json.$tag.TagNameGlobal)`","
        "`t`"interval`": `"$($sml)`""
        "},"
    }
}