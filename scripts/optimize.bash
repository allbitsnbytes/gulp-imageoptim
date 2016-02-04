#!/bin/bash
#
# Run ImageOptim to optimize batch of images

# Variables
BATCH_IMAGES="${1}"
JPEGMINI=""
CWD="$( dirname "${BASH_SOURCE[0]}" )"
LOGFILE="gulp_imageoptim_results.log"

# Check for the path to imageoptim-cli
if [[ -d ${CWD}/../node_modules/imageoptim-cli ]]; then
  IMAGEOPTIM="${CWD}/../node_modules/imageoptim-cli/bin/imageOptim"
elif [[ -d ${CWD}/../../imageoptim-cli ]]; then
  IMAGEOPTIM="${CWD}/../../imageoptim-cli/bin/imageOptim"
else
  echo "Could not find imageoptim-cli library"
  exit 1
fi

# Check if path to images specified
if [[ -z "${BATCH_IMAGES}" ]]; then
  printf "No images were specified"
  exit 1
fi

# Toggle jpegmini flag
if [[ "${2}" = "--jpegmini" ]]; then
  JPEGMINI="-j"
fi

# Let the optimization begin ...
${IMAGEOPTIM} -a -c -q ${JPEGMINI} -d ${BATCH_IMAGES} > ${LOGFILE}
EXIT_STATUS=$?

# Output result
if [[ ${EXIT_STATUS} -eq 0 ]]; then
  if [[ -f ${LOGFILE} ]]; then
  	cat ${LOGFILE} | grep TOTAL
  fi
else
  cat ${LOGFILE} | grep Error:
fi

# Clean up
if [[ -f ${LOGFILE} ]]; then
  rm ${LOGFILE}
fi

exit ${EXIT_STATUS}