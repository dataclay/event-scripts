var targetComp = $D.target(),
    comp_fps   = targetComp.frameRate;
    f_start    = parseInt($D.job.get("workarea-start"));
    f_end      = parseInt($D.job.get("workarea-end"));

targetComp.workAreaStart    = (f_start / comp_fps);
targetComp.workAreaDuration = (f_end / comp_fps) - targetComp.workAreaStart;