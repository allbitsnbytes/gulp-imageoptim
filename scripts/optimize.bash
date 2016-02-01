#!/bin/bash
#
# Run ImageOptim to optimize batch of images

BATCH_IMAGES="${1}"
JPEGMINI=""
IMAGEOPTIM="$( dirname "${BASH_SOURCE[0]}" )/../node_modules/imageoptim-cli/bin/imageOptim"
LOGFILE="gulp_imageoptim_results.log"

# Check if path to images specified
if [[ -z "${BATCH_IMAGES}" ]]; then
  printf "No images were specified"
  exit 1
fi

# Toggle jpegmini flag
if [[ "${2}" = "--jpegmini" ]]; then
  JPEGMINI="-j"
fi

${IMAGEOPTIM} -a -c -q ${JPEGMINI} -d ${BATCH_IMAGES} > ${LOGFILE}
EXIT_STATUS=$?

# Output result
if [[ ${EXIT_STATUS} -eq 0 ]]; then
  if [[ -f "${LOGFILE}" ]]; then
  	cat ${LOGFILE} | grep TOTAL
  fi
else
  cat ${LOGFILE} | grep Error:
fi

# Clean up
if [[ -f "${LOGFILE}" ]]; then
  rm ${LOGFILE}
fi

exit ${EXIT_STATUS}