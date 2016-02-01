#!/bin/bash
#
# Run ImageOptim to optimize batch of images


BATCH_IMAGES="${1}"
JPEGMINI="${2:+ -j}"
IMAGEOPTIM="$( dirname "${BASH_SOURCE[0]}" )/../node_modules/imageoptim-cli/bin/imageOptim"

if [[ -z "${BATCH_IMAGES}" ]]; then
  printf "No images were specified"
  exit 1
fi

RESULT="$( ${IMAGEOPTIM} -a -c -q ${JPEGMINI} -d ${BATCH_IMAGES} )"
EXIT_STATUS=$?

if [[ ${EXIT_STATUS} -eq 0 ]];
  echo "$( echo ${RESULT} | grep saving: | grep -v TOTAL | cut -d" " -f1,6,7,8 )"
else
  echo "$( echo ${RESULT} | grep Error: )"
fi

exit ${EXIT_STATUS}